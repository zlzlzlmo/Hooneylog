import Layout from 'components/templates/layout/Layout';
import Image from 'next/image';
import React from 'react';
import styles from './NotFound.module.scss';

const NotFound = () => {
  return (
    <Layout>
      <section className={styles.container}>
        <div className={styles.content}>
          <Image src="/404.png" width={500} height={200} objectFit="cover" alt="404 image" />
          <div className={styles.text}>페이지를 찾을 수 없습니다.</div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
