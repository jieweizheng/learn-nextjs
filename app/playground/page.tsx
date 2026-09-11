import styles from "./pg.module.css"
import { lusitana } from "@/app/ui/fonts";
import Image from 'next/image';

// app/playground/page.tsx —— 写成一个完整的页面组件
// （注意：整页必须是组件，不能只写一个裸的 <div />）
export default function Page() {
    return (
      <>
        <div className={styles.shape} />
        <p className={lusitana.className}>用 Lusitana 渲染的一段文字</p>
        <Image
          src="/hero-desktop.png"
          width={1000}
          height={760}
          className="hidden md:block"
          alt="Acme dashboard 预览图"
        />
        <Image
          src="/hero-mobile.png"
          width={560}
          height={620}
          className="block md:hidden"
          alt="Acme dashboard 移动端预览"
        />
      </>
    );
  }
