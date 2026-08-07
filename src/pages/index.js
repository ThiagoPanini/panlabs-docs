import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

/**
 * Provisória. A landing de verdade — cinco seções, ilha de espetáculo, glow que
 * respira, figura do trilho e a regra da dobra — é do slice 6.
 *
 * Ela renderiza `<main>` porque sem isso o skip link cai na reserva e o marco de
 * página fica errado.
 */
export default function Home() {
  return (
    <Layout description="Documentação de referência do Trilho, construída em Docusaurus.">
      <main className={styles.reserva}>
        <h1 className={styles.titulo}>Trilho</h1>
        <p className={styles.linha}>
          A plataforma de pagamentos que some do caminho. Esta é a documentação
          de referência — e o objeto real deste repositório é a arquitetura de
          tokens que a pinta.
        </p>
        <Link className={styles.acao} to="/docs/comece-aqui/ambientes">
          Comece pelos ambientes
        </Link>
      </main>
    </Layout>
  );
}
