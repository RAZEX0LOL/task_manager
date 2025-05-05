import {Dialog} from "@headlessui/react";
import React from "react";
import {useForm} from "react-hook-form";
import Button from "./Button";
import Loading from "./Loading";
import ModalWrapper from "./ModalWrapper";
import Textbox from "./Textbox";
import {useChangePasswordMutation} from "../redux/slices/api/userApiSlice";
import {toast} from "sonner";

const ChangePassword = ({ open, setOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [changeUserPassword, { isLoading }] = useChangePasswordMutation();

  const handleOnSubmit = async (data) => {
    if (data.password !== data.cpass) {
      toast.warning("Пароли не совпадают");
      return;
    }
    try {
      const res = await changeUserPassword(data).unwrap();
      toast.success("Новый пользователь успешно создан");

      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-200 mb-4'
          >
            Смена пароля
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Введите новый пароль'
              type='password'
              name='password'
              label='Новый пароль'
              className='w-full rounded'
              register={register("password", {
                required: "New Passowrd is required!",
              })}
              error={errors.password ? errors.password.message : ""}
            />
            <Textbox
              placeholder='Подтвердите новый пароль'
              type='password'
              name='cpass'
              label='Подтверждение нового пароля'
              className='w-full rounded'
              register={register("cpass", {
                required: "Обязательно потдвердите новый пароль!",
              })}
              error={errors.cpass ? errors.cpass.message : ""}
            />
          </div>

          {isLoading ? (
            <div className='py-5'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
              <Button
                type='submit'
                className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto'
                label='Сохранить'
              />

              <button
                type='button'
                className='bg-stone-900 px-5 text-sm font-semibold text-gray-200 sm:w-auto'
                onClick={() => setOpen(false)}
              >
                Отмена
              </button>
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default ChangePassword;
