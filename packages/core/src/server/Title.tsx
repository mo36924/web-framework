type Props = {
  children: string;
};

export const Title = (props: Props) => <title>{props.children}</title>;
