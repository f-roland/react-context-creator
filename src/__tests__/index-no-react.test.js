import { createContext } from "../index";

jest.mock("create-react-context", () =>
  jest.fn(() => ({
    Consumer: jest.fn(),
    Provider: jest.fn()
  }))
);

jest.mock("react", () => ({
  ...require.requireActual("react"),
  createContext: undefined
}));

const createReactContext = require("create-react-context");

describe("when react context api is not defined", () => {
  it("uses the polyfill", () => {
    createContext({ foo: "bar" });
    expect(createReactContext).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: "bar",
        setFoo: expect.any(Function)
      })
    );
  });
});
