import React from 'react';
import styled from '@emotion/styled';

import { ExplorerLink } from 'components/ExplorerLink';
import { IconClose } from 'assets/IconClose';
// import { IconEdit } from 'assets/IconEdit';
import { TableSkeleton } from 'components/TableSkeleton';

import { LoadStatus } from 'constant/loading';
import { WhitelistNft } from 'solana-candy-shop-schema/dist';
interface WhitelistProps {
  collections: WhitelistNft[];
  loading: LoadStatus;
  openDeleteModal: (...arg: any) => () => void;
}

export const Whitelist: React.FC<WhitelistProps> = ({
  collections,
  loading,
  openDeleteModal,
}) => {
  return (
    <Wrap>
      <Table>
        <Header>
          <tr>
            <td>MINT ADDRESS</td>
            <td>COLLECTIONS SYMBOL</td>
            <td>CREATOR ADDRESS</td>
            <td>ACTIONS</td>
          </tr>
        </Header>
        <tbody>
          {loading === LoadStatus.Loading ? (
            <>
              <TableSkeleton numCol={4} />
              <TableSkeleton numCol={4} />
              <TableSkeleton numCol={4} />
            </>
          ) : loading === LoadStatus.Loaded && collections.length ? (
            collections.map((item, idx) => (
              <tr key={idx} className="cds-wl-row">
                <td>
                  <ExplorerLink type="address" address={item.tokenMint} />
                </td>

                <td>{item.symbol}</td>
                <td>
                  <ExplorerLink
                    type="address"
                    address={item.creators[0].address}
                  />
                </td>

                <td>
                  <div className="cds-wl-action">
                    {/* <span className="cds-wl-edit">
                        <IconEdit />
                        Edit
                      </span> */}
                    <div
                      className="cds-wl-delete"
                      onClick={openDeleteModal(item)}
                    >
                      <IconClose />
                      Remove
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : null}
        </tbody>
      </Table>
    </Wrap>
  );
};

const Wrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  .cds-wl {
    &-action {
      display: flex;
    }
    &-delete {
      color: red;
      cursor: pointer;
      display: flex;
      align-items: center;

      svg {
        margin-right: 8px;
      }
    }

    &-edit {
      cursor: pointer;
      margin-right: 10px;
      display: flex;
      align-items: center;

      svg {
        margin-right: 8px;
      }
    }

    &-row {
      border-bottom: 1px solid #bdbdbd;
      height: 40px;
    }
  }
`;

const Header = styled.thead`
  border-bottom: 2px solid black;
  color: #bdbdbd;
  font-weight: 700;
  font-size: 12px;
`;
