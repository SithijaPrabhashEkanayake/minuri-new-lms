import React, { useState } from 'react';

const defaultAccordionItems = [
  {
    id: 1,
    title: '',
    imageUrl: '/images/11.png',
  },
  {
    id: 2,
    title: '',
    imageUrl: '/images/22.png',
  },
  {
    id: 3,
    title: '',
    imageUrl: '/images/33.png',
  },
  {
    id: 4,
    title: '',
    imageUrl: '/images/44.png',
  },
  {
    id: 5,
    title: '',
    imageUrl: '/images/55.png',
  },
];

const AccordionItem = ({ item, isActive, onMouseEnter }) => {
  return (
    <div
      className={`accordion-item ${isActive ? 'active' : 'inactive'}`}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="accordion-img"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/400x450/2d3748/ffffff?text=Image+Error';
        }}
      />
      <div className="accordion-overlay"></div>
      <div className={`accordion-text ${isActive ? 'active' : 'inactive'}`}>
        <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{item.title}</div>
        {item.description && (
          <div className="accordion-desc">
            {item.description}
          </div>
        )}
      </div>
    </div>
  );
};

export function InteractiveAccordion({ items = defaultAccordionItems }) {
  const [activeIndex, setActiveIndex] = useState(items.length - 1);

  const handleItemHover = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="accordion-container">
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => handleItemHover(index)}
        />
      ))}
    </div>
  );
}
