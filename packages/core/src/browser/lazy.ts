import { Component, ComponentType, createElement } from "preact";

export const lazy = <T>(
  loader: () => Promise<{ default: ComponentType<T> }>,
): ComponentType<T> & { load: () => Promise<any> } => {
  let promise: Promise<any> | undefined;
  let component: ComponentType<T> | null = null;

  const load = () =>
    (promise ||= loader().then((exports) => {
      component = exports.default;
    }));

  class Lazy extends Component<T> {
    static load = load;
    constructor(props: any, context: any) {
      super(props, context);
      load();
    }
    c = component;
    componentDidMount() {
      this.c || load().then(() => this.forceUpdate());
    }
    render(props: any) {
      return this.c && createElement(this.c, props);
    }
  }

  return Lazy;
};
