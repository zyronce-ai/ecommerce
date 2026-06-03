import Link from 'next/link';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    image: string;
    count: number;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.name.toLowerCase()}`}
      className="group relative overflow-hidden rounded-xl"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="font-semibold">{category.name}</h3>
        {category.count > 0 && <p className="text-sm text-white/80">{category.count} items</p>}
      </div>
    </Link>
  );
}
