import styles from './FormButton.module.css';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const FormButton = (props: Props) => (
  <button className={styles.button} {...props} />
);