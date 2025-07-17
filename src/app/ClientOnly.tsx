"use client"
import { ReactNode, useState, useEffect } from 'react';

interface Props {
    children?: ReactNode
}

export function ClientOnly({ children, ...delegated }: Props) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return (
    <div {...delegated}>
      {children}
    </div>
  );
}
