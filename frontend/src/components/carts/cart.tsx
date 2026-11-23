import { useCart } from "../../context/CartContext";

export const cart: React.FC = () => {
  const { items } = useCart();
  return (
    <div>
      {items.length === 0 ? (
        <div>
          <h2>No items to display</h2>
        </div>
      ) : (
        <div>
          <ul>
            <li>item one </li>
            <li>item two</li>
            <li>item three</li>
            <li>item four</li>
            <li>item five</li>
          </ul>
        </div>
      )}
    </div>
  );
};
