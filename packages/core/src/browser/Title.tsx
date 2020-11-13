type Props = {
  children: string;
};

export const Title = (props: Props) => {
  document.title = props.children;
  return null;
};
