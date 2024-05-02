import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import appWriteServices from "../../appwrite/config";
import { Button, Input, RTE, Select } from "../index";

function PostFormPractice({ post }) {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, control, getValues } =
    useForm({
      title: post?.post.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      status: post?.status || "active",
    });

  const userData = useSelector((status) => status.auth.userData);

  const submit = async (data) => {
    if (post) {
      const file = data.image[0]
        ? appWriteServices.uploadFile(data.image[0])
        : null;
      if (file) {
        appWriteServices.deleteFile(post.featuredImage);
      }
      const dbPost = await appWriteServices.updatePost(post.$id, {
        ...data,
        featuredImage: file ? file.$id : undefined,
      });
      if (dbPost) {
        navigate(`/post/${dbPost.$id}`);
      }
    } else {
      const file = appWriteServices.uploadFile(data.image[0]);
      if (file) {
        const fileId = file.$id;
        data.featuredImage = fileId;

        const dbPost = await appWriteServices.createPost({
          ...data,
          userId: userData.$id,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      }
    }
  };

  const slugTranform = useCallback((value) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/^[a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");
    }

    return "";
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTranform(value.title, { shouldValidate: true }));
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, slugTranform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title: "
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <RTE
          label="Content : "
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />

        {post && (
          <div className="mb-4 w-full">
            <img
              src={appWriteServices.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}

        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />

        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default PostFormPractice;
