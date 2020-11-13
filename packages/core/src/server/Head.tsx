import jsesc from "jsesc";
import type { JSX } from "preact";
import { styleId } from "../env";
import { Consumer } from "./context";
import { styles } from "./css";

type Props = JSX.IntrinsicElements["head"];

export const Head = ({ children, ...props }: Props) => (
  <Consumer>
    {(value) => {
      if (value.prepass) {
        return <>{children}</>;
      }

      const type = value.type;
      const isNoModule = type === "nomodule";
      const styleType = type === "modern" ? 0 : type === "module" ? 1 : 2;

      return (
        <head {...props}>
          <meta charSet="utf-8" />
          {isNoModule ? <meta httpEquiv="X-UA-Compatible" content="IE=edge" /> : null}
          {children}
          <script src={value.src} type={isNoModule ? undefined : "module"} noModule={isNoModule} defer={isNoModule} />
          <style
            id={styleId}
            dangerouslySetInnerHTML={{
              __html: jsesc(
                Object.values(value.classes)
                  .map((className) => styles[className][1][styleType])
                  .join(""),
                { isScriptContext: true },
              ),
            }}
          />
        </head>
      );
    }}
  </Consumer>
);
