import React from 'react';
import { useShop } from '../context/ShopContext';

// Shows the price a customer pays. When an offer is live, the regular price
// sits beside it, struck through.
export default function OfferPrice({ price, basePrice, className = '' }) {
  const { formatPrice } = useShop();
  const onOffer = Number(basePrice) > Number(price);
  return (
    <span className={`offer-price ${className}`}>
      <span className={`price-now ${onOffer ? 'on-offer' : ''}`}>{formatPrice(price)}</span>
      {onOffer && (
        <s className="price-was">
          <span className="sr-only">Regular price </span>
          {formatPrice(basePrice)}
        </s>
      )}
    </span>
  );
}
