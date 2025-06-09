import styles from './RedirectMessage.module.css';
import { Link } from 'react-router-dom';

interface Props {
  question: string;
  linkText: string;
  linkTo: string;
}

export const RedirectMessage = ({ question, linkText, linkTo }: Props) => (
  <div className={styles.redirect}>
    <p>{question}</p>
    <Link to={linkTo}>{linkText}</Link>
  </div>
);