  // useEffect(() => {
  //   // Проверка наличия токена в localStorage или куки
  //   const storedToken = localStorage.getItem('token');
  //   if (storedToken) {
  //     // Отправить запрос на сервер для проверки токена и получения данных пользователя
  //     // Если токен валиден, установить user
  //     // Пример: fetch('/api/getUser', { headers: { 'Authorization': `Bearer ${storedToken}` }})
  //     //   .then(res => res.json())
  //     //   .then(data => setUser(data.user))
  //     //   .catch(() => {
  //     //     localStorage.removeItem('token'); // Удалить невалидный токен
  //     //     setUser(null);
  //     //   });
  //   }
  // }, []);