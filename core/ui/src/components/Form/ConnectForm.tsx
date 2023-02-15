import { useFormContext } from 'react-hook-form';

export const ConnectForm: React.FC<{ children: any }> = ({ children }) => {
  const methods = useFormContext();

  return children({ ...methods });
};
