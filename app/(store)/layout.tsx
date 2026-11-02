import { StoreFooter, StoreHeader} from "@/components/storefront-ui";


export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader />
      {children}
      <StoreFooter />
    </>
  );
}
