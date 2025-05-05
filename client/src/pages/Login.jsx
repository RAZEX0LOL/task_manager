import {useForm} from "react-hook-form";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {Button, Loading, Textbox} from "../components";
import {useLoginMutation} from "../redux/slices/api/authApiSlice";
import {setCredentials} from "../redux/slices/authSlice";
import {useEffect} from "react";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (data) => {
    try {
      const res = await login(data).unwrap();

      dispatch(setCredentials(res));
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user]);

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-stone-900 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3  rounded-full text-sm md:text-base dark:border-gray-700 dark:text-blue-400 border-gray-200 text-gray-200'>
              Управляйте всеми своими задачами в одном месте!
            </span>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center dark:text-gray-400 text-blue-700'>
              <span>Облачный сервис</span>
              <span>Менеджер задач</span>
            </p>

            <div className='cell'>
              <div className='circle rotate-in-up-left'></div>
            </div>
          </div>
        </div>

        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center '>
          <form
            onSubmit={handleSubmit(handleLogin)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-stone dark:bg-slate-600 px-10 pt-14 pb-14 bg-stone-700'
          >
            <div>
              <p className='text-blue-600 text-3xl font-bold text-center'>
                С возвращением!
              </p>
              <p className='text-center text-base text-gray-700 dark:text-gray-500'>
                Храните все свои учетные данные в безопасности!
              </p>
            </div>
            <div className='flex flex-col gap-y-5'>
              <Textbox
                  placeholder='you@example.com'
                  type='email'
                  name='email'
                  label='Адрес электронной почты'
                  className='w-full rounded-full'
                  register={register("email", {
                    required: "Адрес электронной почты обязателен!",
                  })}
                  error={errors.email ? errors.email.message : ""}
              />
              <Textbox
                  placeholder='пароль'
                  type='password'
                  name='password'
                  label='Пароль'
                  className='w-full rounded-full'
                  register={register("password", {
                    required: "Пароль обязателен!",
                  })}
                  error={errors.password ? errors.password?.message : ""}
              />

            </div>
            {isLoading ? (
                <Loading />
            ) : (
                <Button
                    type='submit'
                    label='Войти'
                    className='w-full h-10 bg-blue-700 text-white rounded-full'
                />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
