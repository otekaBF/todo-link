import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Input,
  HStack,
  Button,
  Text,
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackDivider,
  Spacer,
  Checkbox,
  IconButton,
} from "@chakra-ui/react";


import { createClient } from "@supabase/supabase-js";
import { MdDeleteOutline } from "react-icons/md";
// import { DropZone } from '@/Components/DropZone'

const supabaseUrl = "https://abghecgrcejwvmgtliex.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey as string);

// function to parse date to DD/MM/YYYY
function parseDate(date: string) {
  const newDate = new Date(date);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();
  return `${day}/${month}/${year}`;
}
interface ITask {
  id: number;
  task: string;
  created_at: string;
  complete: boolean;
}
export default function Home(): React.ReactElement {
  // const [ images, setImages] = useState([])
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<ITask[]>([]);

  async function getTasks() {
    let { data, error } = await supabase.from("tasks").select("*").order("id");
    console.log(data, error);
    setTasks(data as ITask[]);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ task: task }]);
    getTasks();
  };

  const handleCkeckTask = async (id: number, complete: boolean) => {
    await supabase.from("tasks").update({ complete }).match({ id: id });
    getTasks();
  };

  const handleDeleteTask = async (id: number) => {
    await supabase.from("tasks").delete().match({ id: id });
    getTasks();
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <div>
      <Box
        as="form"
        onSubmit={handleSubmit}
        p={8}
        mt={100}
        mx="auto"
        maxW={1000}
      >
        <HStack alignItems="end">
          <Heading>TodoLink</Heading>
          <Text color="gray.300" fontWeight="bolds">
            by Elon Sanchez
          </Text>
        </HStack>
        <HStack my={3}>
          <Input
            required
            placeholder="Add a task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <Button type="submit" colorScheme="blue">
            Create
          </Button>
        </HStack>
        <Card mt={8}>
          <CardHeader>
            <Heading size="md">My Tasks</Heading>
          </CardHeader>

          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              {tasks.map((taskItem) => (
                <Box key={taskItem.id}>
                  <Heading size="xs" textTransform="uppercase">
                    {parseDate(taskItem.created_at)}
                  </Heading>
                  <HStack>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        isChecked={taskItem.complete}
                        onChange={(e) =>
                          handleCkeckTask(taskItem.id, e.target.checked)
                        }
                      />
                      <Text ml={3} fontSize="sm">
                        {taskItem.task}
                      </Text>
                    </Box>
                    <Spacer />
                    <IconButton
                      onClick={() => handleDeleteTask(taskItem.id)}
                      ml={8}
                      aria-label="Search database"
                      colorScheme="red"
                      icon={<MdDeleteOutline />}
                    />
                  </HStack>
                </Box>
              ))}
            </Stack>
          </CardBody>
        </Card>
        {/* <DropZone images={images} onChange={ (images) => setImages(images as never[])}  /> */}
      </Box>
    </div>
  );
}
