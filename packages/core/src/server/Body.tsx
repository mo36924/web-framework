import jsesc from "jsesc";
import type { ComponentChildren } from "preact";
import { rootId, storeId } from "../env";
import { Consumer } from "./context";
import type { Store } from "./store";

type Props = {
  children?: ComponentChildren;
};

export const Body = (props: Props) => (
  <Consumer>
    {(value) => {
      if (value.prepass) {
        return <>{props.children}</>;
      }

      const store: Store = { classes: value.classes, graphql: value.graphql };

      const storeJson = jsesc(store, {
        isScriptContext: true,
        json: true,
      });

      return (
        <body>
          <div id={rootId}>{props.children}</div>
          <script
            id={storeId}
            type="application/json"
            dangerouslySetInnerHTML={{
              __html: storeJson,
            }}
          />
        </body>
      );
    }}
  </Consumer>
);
