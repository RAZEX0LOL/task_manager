import {Dialog} from "@headlessui/react";
import clsx from "clsx";
import {FaQuestion} from "react-icons/fa";
import {Button, ModalWrapper} from "./";

export default function ConfirmatioDialog({
                                            open,
                                            setOpen,
                                            msg,
                                            onClick = () => {},
                                            type = "delete",
                                            setMsg = () => {},
                                            setType = () => {},
                                          }) {
  const closeDialog = () => {
    setType("delete");
    setMsg(null);
    setOpen(false);
  };

  return (
      <>
        <ModalWrapper open={open} setOpen={closeDialog}>
          <div className='py-4 w-full flex flex-col gap-4 items-center justify-center'>
            <Dialog.Title as='h3' className=''>
              <p
                  className={clsx(
                      "p-3 rounded-full ",
                      type === "restore" || type === "restoreAll"
                          ? "text-yellow-600 bg-yellow-100"
                          : "text-red-600 bg-red-200"
                  )}
              >
                <FaQuestion size={60} />
              </p>
            </Dialog.Title>

            <p className='text-center text-gray-500'>
              {msg ?? "Вы уверены, что хотите удалить выбранную запись?"}
            </p>

            <div className='bg-stone-900 py-3 sm:flex sm:flex-row-reverse gap-4'>
              <Button
                  type='button'
                  className={clsx(
                      " px-8 text-sm font-semibold text-white sm:w-auto",
                      type === "restore" || type === "restoreAll"
                          ? "bg-yellow-600"
                          : "bg-red-600 hover:bg-red-500"
                  )}
                  onClick={onClick}
                  label={type === "restore" ? "Восстановить" : "Удалить"}
              />

              <Button
                  type='button'
                  className='bg-stone-900 px-8 text-sm font-semibold text-gray-200 sm:w-auto border'
                  onClick={() => closeDialog()}
                  label='Отмена'
              />
            </div>
          </div>
        </ModalWrapper>
      </>
  );
}

export function UserAction({ open, setOpen, onClick = () => {} }) {
  const closeDialog = () => {
    setOpen(false);
  };

  return (
      <>
        <ModalWrapper open={open} setOpen={closeDialog}>
          <div className='py-4 w-full flex flex-col gap-4 items-center justify-center'>
            <Dialog.Title as='h3' className=''>
              <p className={clsx("p-3 rounded-full ", "text-red-600 bg-red-200")}>
                <FaQuestion size={60} />
              </p>
            </Dialog.Title>

            <p className='text-center text-gray-500'>
              {"Вы уверены, что хотите активировать или деактивировать этот аккаунт?"}
            </p>

            <div className='bg-stone-900 py-3 sm:flex sm:flex-row-reverse gap-4'>
              <Button
                  type='button'
                  className={clsx(
                      " px-8 text-sm font-semibold text-white sm:w-auto",
                      "bg-red-600 hover:bg-red-500"
                  )}
                  onClick={onClick}
                  label={"Да"}
              />

              <Button
                  type='button'
                  className='bg-stone-900 px-8 text-sm font-semibold text-gray-200 sm:w-auto border'
                  onClick={() => closeDialog()}
                  label='Нет'
              />
            </div>
          </div>
        </ModalWrapper>
      </>
  );
}