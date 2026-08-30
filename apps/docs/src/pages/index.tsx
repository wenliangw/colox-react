import { Button } from '@colox/react';
import '@colox/react/style.css';
import '@colox/react/themes/light.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout>
      <main className={styles.hero}>
        <h1 className={styles.title}>{siteConfig.title}</h1>
        <p className={styles.tagline}>{siteConfig.tagline}</p>
        <div className={styles.actions}>
          <Button variant="primary" size="lg">
            Get Started
          </Button>
          <Button variant="ghost" size="lg">
            GitHub
          </Button>
        </div>
      </main>
    </Layout>
  );
}
