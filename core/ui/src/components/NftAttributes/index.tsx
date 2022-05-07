import React from 'react';

interface NftAttributesProps {
  attributes: Array<{ trait_type: string; value: string }> | undefined;
  loading: boolean;
}

export const NftAttributes: React.FunctionComponent<NftAttributesProps> = ({ attributes, loading }) => {
  return (
    <div className="candy-stat">
      <div className="candy-label">ATTRIBUTES</div>
      <div className="candy-attribute-container">
        {loading ? (
          <div className="candy-loading candy-loading-sm" />
        ) : attributes && attributes.length > 0 ? (
          attributes.map((attribute) => (
            <div className="candy-nft-attribute" key={attribute.trait_type}>
              {attribute.trait_type}: {attribute.value}
            </div>
          ))
        ) : (
          <div className="candy-value">No attributes</div>
        )}
      </div>
    </div>
  );
};
