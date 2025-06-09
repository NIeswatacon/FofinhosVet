import styles from './InputField.module.css';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const InputField = (props: Props) => (
  <input className={styles.input} {...props} />
);