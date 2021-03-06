import * as React from "react";
import { shallow } from "enzyme";

import { NOOP, getSetterName, createContextSetters } from "../helpers";

function stateValidator({ property, value }) {
  return (
    (property === "foo" && value === "new foo") ||
    (property === "bar" && value === "new bar")
  );
}

const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

describe("NOOP", () => {
  it("does nothing", () => {
    expect(NOOP()).toBeUndefined();
  });
});

describe("getSetterName", () => {
  it("returns a setter name for the given property name", () => {
    expect(getSetterName("fooBar")).toBe("setFooBar");
  });
});

describe("createContextSetters", () => {
  describe("when state validator is provided", () => {
    class Component extends React.Component {
      constructor(props) {
        super(props);
        this.state = { foo: "foo", bar: "bar" };
        createContextSetters(["foo", "bar"], this, { stateValidator });
      }
      render() {
        return (
          <div>
            <p>I am a component</p>
          </div>
        );
      }
    }

    const wrapper = shallow(<Component />);
    const instance = wrapper.instance();
    const setStateSpy = jest.spyOn(instance, "setState");

    afterEach(() => {
      setStateSpy.mockClear();
      consoleSpy.mockClear();
    });

    it("adds all properties and setters to the component", () => {
      expect(instance).toHaveProperty("setFoo");
      expect(instance.setFoo).toBeFunction();
      expect(instance).toHaveProperty("setBar");
      expect(instance.setBar).toBeFunction();
    });

    it("calls setState when the setters are called & the validator passes", () => {
      expect(instance.state).toMatchSnapshot();

      instance.setFoo("new foo");
      expect(instance.state).toMatchSnapshot();

      instance.setBar("new bar");
      expect(instance.state).toMatchSnapshot();

      expect(setStateSpy).toHaveBeenCalledTimes(2);
      expect(setStateSpy.mock.calls).toMatchSnapshot();
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("skips the update if the state validator doesn't pass", () => {
      expect(instance.state).toMatchSnapshot();

      instance.setFoo("invalid foo");
      expect(instance.state).toMatchSnapshot();

      instance.setBar("invalid bar");
      expect(instance.state).toMatchSnapshot();

      expect(setStateSpy).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy.mock.calls).toMatchSnapshot();
    });
  });

  describe("when no state validator is provided", () => {
    class Component extends React.Component {
      constructor(props) {
        super(props);
        this.state = { foo: "foo", bar: "bar" };
        createContextSetters(["foo", "bar"], this);
      }
      render() {
        return (
          <div>
            <p>I am a component </p>
          </div>
        );
      }
    }

    const wrapper = shallow(<Component />);
    const instance = wrapper.instance();
    const setStateSpy = jest.spyOn(instance, "setState");

    afterEach(() => {
      setStateSpy.mockClear();
      consoleSpy.mockClear();
    });

    it("adds all properties and setters to the component", () => {
      expect(instance).toHaveProperty("setFoo");
      expect(instance.setFoo).toBeFunction();
      expect(instance).toHaveProperty("setBar");
      expect(instance.setBar).toBeFunction();
    });

    it("calls setState when the setters are called, no matter what the value is", () => {
      expect(instance.state).toMatchSnapshot();

      instance.setFoo("invalid foo");
      expect(instance.state).toMatchSnapshot();

      instance.setBar("invalid bar");
      expect(instance.state).toMatchSnapshot();

      expect(setStateSpy).toHaveBeenCalledTimes(2);
      expect(setStateSpy.mock.calls).toMatchSnapshot();
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
