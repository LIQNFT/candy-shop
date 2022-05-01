import React, { useRef, useState } from 'react';
import { useClickOutside } from 'hooks/useClickOutside';

import IconChevronDown from 'assets/IconChevronDown';
import IconChevronUp from 'assets/IconChevronUp';
import './index.less';

type DropdownItem = {
  value: any;
  label: string;
};

interface DropdownProps {
  selectedItem?: DropdownItem;
  items: DropdownItem[];
  onSelectItem?: (item: DropdownItem) => void;
}

export const Dropdown: React.FunctionComponent<DropdownProps> = ({ selectedItem, items, onSelectItem }) => {
  const dropdownRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentlySelectedItem, setCurrentlySelectedItem] = useState(
    selectedItem || (items.length > 0 ? items[0] : null)
  );

  useClickOutside(dropdownRef, () => {
    setIsMenuOpen(false);
  });

  return (
    <div className="candy-dropdown" ref={dropdownRef} onClick={() => setIsMenuOpen((isOpen) => !isOpen)}>
      <div className="candy-dropdown-flex">
        <div className={`candy-dropdown-label candy-dropdown-label--${isMenuOpen ? 'purple' : 'black'}`}>
          {currentlySelectedItem?.label}
        </div>
        {isMenuOpen ? (
          <div className="candy-dropdown-icon">
            <IconChevronUp />
          </div>
        ) : (
          <div className="candy-dropdown-icon">
            <IconChevronDown />
          </div>
        )}
      </div>
      {isMenuOpen ? (
        <div className="candy-dropdown-menu">
          {items.map((item, index) => (
            <div
              className={index < items.length - 1 ? 'menu-middle-item' : 'menu-last-item'}
              key={index}
              onClick={() => {
                setCurrentlySelectedItem(item);
                onSelectItem && onSelectItem(item);
              }}
            >
              <div className="candy-dropdown-label">{item.label}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
