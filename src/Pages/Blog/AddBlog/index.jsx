import axios from "axios";
import { Container, Group } from "@mantine/core";
import { useMutation, useQuery } from "react-query";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import InputField from "../../../components/InputField";
import TextArea from "../../../components/TextArea";
import Button from "../../../components/Button";
import PageHeader from "../../../components/PageHeader";
import { backendUrl } from "../../../constants/constants";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../contexts/UserContext";
import DropZone from "../../../components/Dropzone";
import { useLocation, useNavigate } from "react-router";
import { routeNames } from "../../../Routes/routeNames";
import SelectMenu from "../../../components/SelectMenu";

export const AddBlog = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  let { state } = useLocation();
  const [categories, setCategories] = useState([]);

  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      blogDescription: "",
      blogImage: null,
      blogTitle: "",
      blogData: "",
    },

    validate: {
      blogTitle: (value) =>
        value?.length > 1 && value?.length < 70
          ? null
          : "Please enter blog title between 2 to 70 characters",
      blogDescription: (value) =>
        value?.length > 0 ? null : "Please enter blog description",
      blogData: (value) => (value?.length > 0 ? null : "Please enter blogData"),
      blogImage: (value) => (value ? null : "Please upload a cover Image"),
    },
  });

  //categories
  const { status } = useQuery(
    "fetchServices",
    () => {
      return axios.get(backendUrl + "/api/v1/web/services");
    },
    {
      onSuccess: (res) => {
        let data = res.data.data.map((item) => {
          return { value: item._id, label: item.title };
        });
        setCategories(data);
      },
    }
  );

  useEffect(() => {
    if (state?.isUpdate) {
      form.setValues(state.data);
     
    }
  }, [state]);
  const handleAddService = useMutation(
    (values) => {
      if (state?.isUpdate)
        return axios.patch(
          `${backendUrl + `/api/v1/blog/${state?.data?._id}`}`,
          values,
          {
            headers: {
              authorization: `Bearer ${user.token}`,
            },
          }
        );
      else
        return axios.post(`${backendUrl + "/api/v1/blog"}`, values, {
          headers: {
            authorization: `Bearer ${user.token}`,
          },
        });
    },
    {
      onSuccess: (response) => {
        if (response.data?.success) {
          showNotification({
            title: "Success",
            message: response?.data?.message,
            color: "green",
          });
          navigate(routeNames.general.viewBlogs);
          form.reset();
        } else {
          showNotification({
            title: "Error",
            message: response?.data?.message,
            color: "red",
          });
        }
      },
    }
  );
  return (
    <Container fluid>
      <PageHeader label={state?.isUpdate ? "Edit Blog" : "Add Blog"} />
      <form
        onSubmit={form.onSubmit((values) => handleAddService.mutate(values))}
      >
        <InputField
          label={"Title"}
          placeholder={"Enter Blog Title"}
          form={form}
          withAsterisk
          validateName={"blogTitle"}
        />

        <TextArea
          label={"Blog Data"}
          placeholder={"Enter Blog Data"}
          rows="4"
          form={form}
          withAsterisk
          validateName={"blogData"}
        />
        <TextArea
          label={"Detail Description"}
          placeholder={"Enter Detailed Description"}
          rows="4"
          form={form}
          withAsterisk
          validateName={"blogDescription"}
        />
        <Group position="center">
          <DropZone
            form={form}
            folderName={"service"}
            name={"blogImage"}
            label="Cover Image"
          />
          {/* <DropZone
            form={form}
            folderName={"service"}
            name={"homeImage"}
            label="Home Image"
          /> */}
        </Group>
        <Group position="right" mt={"md"}>
          <Button
            label={"Cancel"}
            variant={"outline"}
            onClick={() => navigate(routeNames.general.viewBlogs)}
          />
          <Button
            label={state?.isUpdate ? "Edit Blog" : "Add Blog"}
            type={"submit"}
            loading={handleAddService.isLoading}
          />
        </Group>
      </form>
    </Container>
  );
};
