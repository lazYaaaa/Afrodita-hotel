// roomsData.js
import { 
  FaSnowflake, 
  FaTv, 
  FaUmbrellaBeach, 
  FaWineBottle, 
  FaFan, 
  FaBaby, 
  FaBed, 
  FaCoffee, 
  FaBath, 
  FaHome, 
  FaWifi,
  FaUtensils,
  FaBlender,
  FaChair,
  FaRuler,
  FaBuilding,
  FaDoorOpen,
  FaUsers,
  FaCalendarAlt,
  FaMoneyBillWave
} from 'react-icons/fa';

export const rooms = [
  {
    id: 0,
    title: "Трёхместный номер c верандой",
    description: "Просторный номер с деревянной верандой и видом на сад. Идеально подходит для семейного отдыха.",
    cost: 3000,
    amenities: [
      { text: "Холодильник", icon: { component: FaSnowflake } },
      { text: "Стиральная машина", icon: { component: FaUmbrellaBeach } },
      { text: "Балкон", icon: { component: FaHome } },
      { text: "Телевизор", icon: { component: FaTv } },
      { text: "Кондиционер", icon: { component: FaFan } },
      { text: "Фен", icon: { component: FaWineBottle } }
    ],
    details: {
      floor: 2,
      area: "22",
      beds: { 
        text: "1 двуспальная + 1 односпальная кровать", 
        icon: { component: FaBed } 
      },
      kitchen: { 
        text: "общая", 
        icon: { component: FaUtensils } 
      },
      bathroom: { 
        text: "в номере", 
        icon: { component: FaBath } 
      },
      capacity: { 
        text: "3 человека", 
        icon: { component: FaUsers } 
      }
    },
    prices: [
      { 
        period: "1 мая - 30 июня", 
        price: 3000,
        icon: { component: FaCalendarAlt }
      },
      { 
        period: "1 июля - 31 августа", 
        price: 3500,
        icon: { component: FaCalendarAlt }
      },
      { 
        period: "1 - 15 сентября", 
        price: 2800,
        icon: { component: FaCalendarAlt }
      }
    ],
    rules: [
      "Дети до 5 лет - бесплатно",
      "Дополнительное место: +1000 руб/сутки",
      "Завтрак включен"
    ]
  },
  {
    id: 1,
    title: "Четырёхместный номер с балконом",
    description: "Светлый номер с большим балконом и видом на море. Прекрасный выбор для компании друзей.",
    cost: 4000,
    amenities: [
      { text: "Холодильник", icon: { component: FaSnowflake } },
      { text: "Микроволновка", icon: { component: FaBlender } },
      { text: "Балкон", icon: { component: FaHome } },
      { text: "Телевизор", icon: { component: FaTv } },
      { text: "Кондиционер", icon: { component: FaFan } }
    ],
    details: {
      floor: 3,
      area: "25",
      beds: { 
        text: "2 двуспальные кровати", 
        icon: { component: FaBed } 
      },
      kitchen: { 
        text: "общая", 
        icon: { component: FaUtensils } 
      },
      bathroom: { 
        text: "в номере", 
        icon: { component: FaBath } 
      },
      capacity: { 
        text: "4 человека", 
        icon: { component: FaUsers } 
      }
    },
    prices: [
      { 
        period: "1 мая - 30 июня", 
        price: 4000,
        icon: { component: FaCalendarAlt }
      },
      { 
        period: "1 июля - 31 августа", 
        price: 4500,
        icon: { component: FaCalendarAlt }
      },
      { 
        period: "1 - 15 сентября", 
        price: 3800,
        icon: { component: FaCalendarAlt }
      }
    ],
    rules: [
      "Дети до 5 лет - бесплатно",
      "Дополнительное место: +1200 руб/сутки"
    ]
  },
  {
    id: 2,
    title: "Семейный номер с балконом",
    description: "Уютный семейный номер с детской зоной. Пространство для комфортного отдыха с детьми.",
    cost: 3000,
    amenities: [
      { text: "Холодильник", icon: { component: FaSnowflake } },
      { text: "Электрочайник", icon: { component: FaCoffee } },
      { text: "Балкон", icon: { component: FaHome } },
      { text: "Телевизор", icon: { component: FaTv } },
      { text: "Детская кроватка", icon: { component: FaBaby } }
    ],
    details: {
      floor: 1,
      area: "28",
      beds: { 
        text: "1 двуспальная кровать + диван", 
        icon: { component: FaBed } 
      },
      kitchen: { 
        text: "общая", 
        icon: { component: FaUtensils } 
      },
      bathroom: { 
        text: "в номере", 
        icon: { component: FaBath } 
      },
      capacity: { 
        text: "2+2 человека", 
        icon: { component: FaUsers } 
      }
    },
    prices: [
      { 
        period: "1 мая - 30 июня", 
        price: 3000,
        icon: { component: FaCalendarAlt }
      },
      { 
        period: "1 июля - 31 августа", 
        price: 3500,
        icon: { component: FaCalendarAlt }
      },
      { 
        period: "1 - 15 сентября", 
        price: 2800,
        icon: { component: FaCalendarAlt }
      }
    ],
    rules: [
      "Дети до 12 лет - бесплатно",
      "Детская кроватка предоставляется бесплатно"
    ]
  },
  {
    id: 3,
    title: "Четырехместный номер",
    description: "Комфортабельный номер для компании друзей. Все необходимое для приятного отдыха.",
    cost: 3500,
    amenities: [
      { text: "Холодильник", icon: { component: FaSnowflake } },
      { text: "Телевизор", icon: { component: FaTv } },
      { text: "Кондиционер", icon: { component: FaFan } },
      { text: "Фен", icon: { component: FaWineBottle } }
    ],
    details: {
      floor: 2,
      area: "24",
      beds: { 
        text: "4 односпальные кровати", 
        icon: { component: FaBed } 
      },
      kitchen: { 
        text: "общая", 
        icon: { component: FaUtensils } 
      },
      bathroom: { 
        text: "в номере", 
        icon: { component: FaBath } 
      },
      capacity: { 
        text: "4 человека", 
        icon: { component: FaUsers } 
      }
    },
    prices: [
      { 
        period: "1 мая - 30 июня", 
        price: 3500,
        icon: { component: FaCalendarAlt }
      },
      { 
        period: "1 июля - 31 августа", 
        price: 4000,
        icon: { component: FaCalendarAlt }
      },
      { 
        period: "1 - 15 сентября", 
        price: 3200,
        icon: { component: FaCalendarAlt }
      }
    ],
    rules: [
      "Дополнительное место: +800 руб/сутки",
      "Минимальное проживание - 2 суток"
    ]
  }
];