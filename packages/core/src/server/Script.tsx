import type { JSX } from "preact";

type Props = JSX.IntrinsicElements["script"];

export const Script = (props: Props) => <script {...props} />;
