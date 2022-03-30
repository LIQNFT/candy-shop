import usePortal from 'hooks/usePortal';
import { createPortal } from 'react-dom';

/**
 * @example
 * <Portal id="modal">
 *   <p>Thinking with portals</p>
 * </Portal>
 */
const Portal = ({ id, children }) => {
  const target = usePortal(id);
  return createPortal(children, target);
};

export default Portal;
