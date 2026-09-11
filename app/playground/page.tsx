import styles from "./pg.module.css"
// app/playground/page.tsx —— 写成一个完整的页面组件
// （注意：整页必须是组件，不能只写一个裸的 <div />）
export default function Page() {
    return (
      <div className={styles.shape} />
    );
  }
