interface ShowProps {
  children: any;
  when?: boolean;
}

export const Show: React.FC<ShowProps> = ({ children, when }) => {
  if (when) return children;
  return null;
};
