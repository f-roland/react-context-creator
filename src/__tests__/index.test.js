import { createContext } from "../index";

jest.mock("react", () => ({
  ...require.requireActual("react"),
  createContext: jest.fn(() => ({
    Provider: jest.fn(),
    Consumer: jest.fn(),
  })),
}));

const mockedProvider = jest.fn();
const mockedWithConsumer = jest.fn();
const mockedWithProvider = jest.fn();

jest.mock("../provider.js", () => ({
  createProvider: jest.fn(() => mockedProvider),
}));

jest.mock("../withConsumer.js", () => ({
  createWithConsumerDecorator: jest.fn(() => mockedWithConsumer),
}));

jest.mock("../withProvider.js", () => ({
  createWithProviderDecorator: jest.fn(() => mockedWithProvider),
}));

const initialContext = { foo: "bar" };

describe("createContext - when React has the new context API", () => {
  const React = require("react");
  const { createProvider } = require("../provider");
  const { createWithConsumerDecorator } = require("../withConsumer");
  const { createWithProviderDecorator } = require("../withProvider");

  const Context = createContext(initialContext);

  it("uses the react API", () => {
    expect(React.createContext).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: "bar",
        setFoo: expect.any(Function),
      })
    );
  });

  it("creates the provider component", () => {
    expect(createProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        ReactContext: expect.objectContaining({
          Provider: expect.any(Function),
          Consumer: expect.any(Function),
        }),
        initialContext,
        contextPropertiesNames: ["foo"],
        contextSettersNames: ["setFoo"],
        stateValidator: expect.any(Function),
      })
    );
  });

  it("creates the consumer decorator", () => {
    expect(createWithConsumerDecorator).toHaveBeenCalledWith(Context.Consumer);
  });

  it("creates the provider decorator", () => {
    expect(createWithProviderDecorator).toHaveBeenCalledWith(Context.Provider);
  });

  it("returns the components and the decorators", () => {
    expect(Context).toMatchSnapshot();
  });
});
