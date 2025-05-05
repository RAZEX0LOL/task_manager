import {Dialog} from "@headlessui/react";
import React from "react";
import {useForm} from "react-hook-form";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {useRegisterMutation} from "../redux/slices/api/authApiSlice";
import {useUpdateUserMutation} from "../redux/slices/api/userApiSlice";
import {setCredentials} from "../redux/slices/authSlice";
import {Button, Loading, ModalWrapper, Textbox} from "./";

const AddUser = ({ open, setOpen, userData }) => {
  let defaultValues = userData ?? {};
  const { user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const dispatch = useDispatch();

  const [addNewUser, { isLoading }] = useRegisterMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const handleOnSubmit = async (data) => {
    try {
      if (userData) {
        const res = await updateUser(data).unwrap();
        toast.success(res?.message);
        if (userData?._id === user?._id) {
          dispatch(setCredentials({ ...res?.user }));
        }
      } else {
        const res = await addNewUser({
          ...data,
          password: data?.password,
        }).unwrap();
        toast.success("Новый пользовать успешно добавлен!");
      }

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
            {userData ? "ОБНОВИТЬ ПРОФИЛЬ" : "ДОБАВИТЬ НОВОГО ПОЛЬЗОВАТЕЛЯ"}
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Введите имя'
              type='text'
              name='name'
              label='Имя'
              className='w-full rounded'
              register={register("name", {
                required: "Full name is required!",
              })}
              error={errors.name ? errors.name.message : ""}
            />
            <Textbox
              placeholder='Введите специальность'
              type='text'
              name='title'
              label='Специальность'
              className='w-full rounded'
              register={register("title", {
                required: "Title is required!",
              })}
              error={errors.title ? errors.title.message : ""}
            />
            <Textbox
              placeholder='Введите email'
              type='email'
              name='email'
              label='Email'
              className='w-full rounded'
              register={register("email", {
                required: "Email Address is required!",
              })}
              error={errors.email ? errors.email.message : ""}
            />

            <Textbox
              placeholder='Введите роль'
              type='text'
              name='role'
              label='Роль'
              className='w-full rounded'
              register={register("role", {
                required: "User role is required!",
              })}
              error={errors.role ? errors.role.message : ""}
            />
            <Textbox
              placeholder='Введите пароль'
              type='password'
              name='password'
              label='Пароль'
              className='w-full rounded'
              register={register("password", {
                required: "Password is required!",
              })}
              error={errors.password ? errors.password.message : ""}
            />
          </div>

          {isLoading || isUpdating ? (
            <div className='py-5'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
              <Button
                type='submit'
                className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto'
                label='Потдвердить'
              />

              <Button
                type='button'
                className='bg-stone-900 px-5 text-sm font-semibold text-gray-200 sm:w-auto'
                onClick={() => setOpen(false)}
                label='Отмена'
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddUser;
