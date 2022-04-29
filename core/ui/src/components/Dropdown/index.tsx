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
  defaultValue?: DropdownItem;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ selectedItem, items, onSelectItem, defaultValue, placeholder }) => {
  const dropdownRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentlySelectedItem, setCurrentlySelectedItem] = useState(defaultValue || selectedItem);

  useClickOutside(dropdownRef, () => {
    setIsMenuOpen(false);
  });

  const onClickItem = (item: any) => () => {
    setCurrentlySelectedItem(item);
    onSelectItem && onSelectItem(item);
  };

  return (
    <div className="candy-dropdown" ref={dropdownRef} onClick={() => setIsMenuOpen((isOpen) => !isOpen)}>
      <div className={`candy-dropdown-flex ${currentlySelectedItem?.label ? '' : 'candy-dropdown-flex-placeholder'}`}>
        {currentlySelectedItem?.label ? (
          <div
            className={`candy-line-limit-1 candy-dropdown-label candy-dropdown-label--${
              isMenuOpen ? 'purple' : 'black'
            }`}
            title={currentlySelectedItem.label}
          >
            {currentlySelectedItem.label}
          </div>
        ) : (
          <div>{placeholder}</div>
        )}
        <div className="candy-dropdown-icon">{isMenuOpen ? <IconChevronUp /> : <IconChevronDown />}</div>
      </div>
      {isMenuOpen ? (
        <div className="candy-dropdown-menu">
          {items.map((item, index) => (
            <div
              className={index < items.length - 1 ? 'menu-middle-item' : 'menu-last-item'}
              key={index}
              onClick={onClickItem(item)}
            >
              <div className="candy-line-limit-1 candy-dropdown-label" title={item.label}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
