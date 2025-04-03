import { AppDispatch } from '../store/store'; 
import { refreshApi } from '../api/refreshApi'; 
import { setTokens, clearTokens } from '../slice/authSlice'; 


export const initializeAuth = () => async (dispatch: AppDispatch) => {
  
  try {
    
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      console.warn('Refresh token отсутствует');
      dispatch(clearTokens());
      return;
    }

    const result = await dispatch(
      refreshApi.endpoints.refreshTokens.initiate({ refresh_token: refreshToken })
    ).unwrap();
    
    console.log('Успешное обновление токенов:', result);
    dispatch(
      setTokens({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      })
    );
    
  } catch (error: any) {

    console.error('Ошибка при обновлении токена:', error);
    dispatch(clearTokens());
    if (error?.status === 401 || error?.status === 403) {
      console.warn('Токен недействителен или истёк. Пользователь будет разлогинен.');
    }
  }
};
