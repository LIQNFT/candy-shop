import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import React from 'react';

export const Row: React.FunctionComponent<ListChildComponentProps<any>> = (
  props
) => {
  const { index, style } = props;
  const label = 'item' + index;
  return (
    <div className="ListItem" style={style}>
      {label}
    </div>
  );
};
const loadMoreItems = () => {
  //
};

export const InfiniteList = (): JSX.Element => {
  return (
    <InfiniteLoader
      isItemLoaded={() => true}
      itemCount={1000}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <List
          className="List"
          height={150}
          itemCount={1000}
          itemSize={30}
          onItemsRendered={onItemsRendered}
          ref={ref}
          width={300}
        >
          {Row}
        </List>
      )}
    </InfiniteLoader>
  );
};
