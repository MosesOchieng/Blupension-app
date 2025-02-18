import styles from '@/styles/auth.module.css'
<div className={styles.authContainer}>
  <form className={styles.authForm}>
    <h2 className={styles.authTitle}>Welcome Back</h2>
    <input 
      className={styles.authInput} 
      type="email" 
      placeholder="Email"
    />
    <input 
      className={styles.authInput} 
      type="password" 
      placeholder="Password"
    />
    <button className={styles.authButton}>
      Login
    </button>
  </form>
</div>

const handleLogin = async () => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password
        });
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        setError('Unable to connect to server. Please try again.');
    }
};
