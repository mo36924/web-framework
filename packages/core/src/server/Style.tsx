import type { JSX } from "preact";

type Props = JSX.IntrinsicElements["style"];

export const Style = (props: Props) => <style {...props} />;
