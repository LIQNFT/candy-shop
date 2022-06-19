import React, { createContext, ReactElement, useContext } from 'react';

interface CandyShopPayContextData {
  stripePublicKey?: string;
}

const CandyShopPayContext = createContext<CandyShopPayContextData | null>(null);

/**
 * The optional payment setup data for enabling 3rd party payment
 * @prop {ReactElement} children children react elements to use this context
 * @prop {string} stripePublicKey an optional stripePubkey for setup the Stripe payment in CandyShop client
 */
export interface CandyShopPayProviderProps {
  children: ReactElement;
  stripePublicKey?: string;
}

export const CandyShopPayProvider: React.FC<CandyShopPayProviderProps> = ({ children, stripePublicKey }) => {
  return <CandyShopPayContext.Provider value={{ stripePublicKey }}>{children}</CandyShopPayContext.Provider>;
};

export const useCandyShopPayContext = (): CandyShopPayContextData | null => {
  return useContext(CandyShopPayContext);
};
