
import useSwipeNavigation from "../hooks/useSwipeGesture";
console.log("is useSwipenav undefined? " + useSwipeNavigation);
export function SwipeableComponent({urlLeft, urlRight, children}) {
  const bind = useSwipeNavigation(urlLeft, urlRight);

  return (
    <div {...bind()} className="touch-none h-full w-full">
      {children}
    </div>
  );
};