import { Dialog } from "@headlessui/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useCreateSubTaskMutation } from "../../redux/slices/api/taskApiSlice"
import Button from "../Button"
import Loading from "../Loading"
import ModalWrapper from "../ModalWrapper"
import Textbox from "../Textbox"

const AddSubTask = ({ open, setOpen, id }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const [addSbTask, { isLoading }] = useCreateSubTaskMutation()

  const handleOnSubmit = async (data) => {
    try {
      const res = await addSbTask({ data, id }).unwrap()

      toast.success(res.message)

      setTimeout(() => {
        setOpen(false)
      }, 500)
    } catch (err) {
      console.log(err)
      toast.error(err?.data?.message || err.error)
    }
  }

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-200 mb-4'
          >
            ДОБАВИТЬ ПОДЗАДАЧУ
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Название подзадачи'
              type='text'
              name='title'
              label='Название'
              className='w-full rounded'
              register={register("title", {
                required: "Название обязательно!",
              })}
              error={errors.title ? errors.title.message : ""}
            />

            <div className='flex items-center gap-4'>
              <Textbox
                placeholder='Дата'
                type='date'
                name='date'
                label='Дата задачи'
                className='w-full rounded'
                register={register("date", {
                  required: "Дата обязательна!",
                })}
                error={errors.date ? errors.date.message : ""}
              />
              <Textbox
                placeholder='Тег'
                type='text'
                name='tag'
                label='Тег'
                className='w-full rounded'
                register={register("tag", {
                  required: "Тег обязателен!",
                })}
                error={errors.tag ? errors.tag.message : ""}
              />
            </div>
          </div>
          {isLoading ? (
            <div className='mt-8'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 flex sm:flex-row-reverse gap-4'>
              <Button
                type='submit'
                className='bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 sm:ml-3 sm:w-auto'
                label='Добавить задачу'
              />

              <Button
                type='button'
                className='bg-stone-900 border text-sm font-semibold text-gray-200 sm:w-auto'
                onClick={() => setOpen(false)}
                label='Отмена'
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  )
}

export default AddSubTask