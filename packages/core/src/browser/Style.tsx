import type { JSX } from "preact";

type Props = JSX.IntrinsicElements["style"];

export default __NODE__ ? (props: Props) => <style {...props} /> : () => null;
