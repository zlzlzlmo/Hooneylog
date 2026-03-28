import useIntersectionObserver from 'hooks/useIntersection/useIntersection';
import { useEffect, useState } from 'react';

interface Props {
  articleRef: React.RefObject<HTMLElement>;
}

const useElementVisible = ({ articleRef }: Props) => {
  const [timeToShow, setIsTimeToShow] = useState<boolean>(false);

  const entry = useIntersectionObserver(articleRef, {});

  useEffect(() => {
    if (entry?.isIntersecting) {
      setIsTimeToShow(true);
    }
  }, [entry?.isIntersecting]);

  return { timeToShow };
};

export default useElementVisible;
