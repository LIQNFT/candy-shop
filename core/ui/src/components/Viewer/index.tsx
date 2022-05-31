import '@google/model-viewer';
import { Order } from '@liqnft/candy-shop-types';
import { LiqImage } from 'components/LiqImage';
import React from 'react';

interface ViewerProps {
  order: Order;
}

export const Viewer: React.FC<ViewerProps> = ({ order }) => {
  if (order && order.nftAnimationLink && order.nftAnimationLink.includes('ext=glb')) {
    return (
      <model-viewer
        style={{ display: 'block', width: '100%', height: '100%' }}
        bounds="tight"
        src={order.nftAnimationLink}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        environment-image="neutral"
        shadow-intensity="1"
      ></model-viewer>
    );
  }

  if (order && order.nftAnimationLink) {
    return <video width="100%" height="auto" controls autoPlay loop src={order.nftAnimationLink}></video>;
  }

  return <LiqImage src={order?.nftImageLink || ''} alt={order?.name} fit="contain" />;
};
