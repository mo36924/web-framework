import type { JSX } from "preact";

type Props = JSX.IntrinsicElements["meta"];

export const Meta = (props: Props) => <meta {...props} />;
