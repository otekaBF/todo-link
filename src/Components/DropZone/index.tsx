import { useState, useRef } from 'react'
import {
  Box,
  Flex,
  Grid,
  Text,
  Button,
  Icon,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  HStack,
  useToast
} from '@chakra-ui/react'
import { BiCloudUpload, BiX } from 'react-icons/bi'
import ImageUploading, {
  ImageListType,
  ImageType
} from 'react-images-uploading'
import Image from 'next/image'

interface IRemoveImageDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  image: ImageType
}

function RemoveImageDialog({
  isOpen,
  onClose,
  onConfirm,
  image
}: IRemoveImageDialogProps) {
  const cancelRef = useRef()

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef as any}
      onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            Eliminar imagen
          </AlertDialogHeader>

          <AlertDialogBody>
            <HStack alignItems='flex-start'>
              <Box
                position='relative'
                height='80px'
                width='100px'
                overflow='hidden'
                rounded='md'>
                {image.dataURL && (
                  <Image
                    src={
                      !image.file
                        ? `${process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL}/${image.dataURL}`
                        : image.dataURL
                    }
                    alt='vista previa de la imagen a eliminar'
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </Box>
              <Text>Deseas eliminar esta imagen?</Text>
            </HStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button type='button' ref={cancelRef as any} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme='red'
              type='button'
              onClick={() => {
                onConfirm()
                onClose()
              }}
              ml={3}>
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

const UploadIcon = ({
  isDragging,
  isError
}: {
  isDragging: boolean
  isError?: boolean
}) => {
  return (
    <Icon
      color={isDragging || isError ? 'white' : 'gray.500'}
      as={BiCloudUpload}
      boxSize={8}
      bg={isDragging ? 'blue.600' : isError ? 'red.500' : 'gray.200'}
      p={1}
      rounded='md'
    />
  )
}

interface IDropZoneProps {
  images: ImageListType
  onChange: (
    value: ImageListType,
    addUpdatedIndex?: number[] | undefined
  ) => void
  isError?: boolean
}

export const DropZone = ({ images, onChange, isError }: IDropZoneProps) => {
  const [imageIndexToDelete, setImageIndexToDelete] = useState<{
    image: ImageType
    index: number
  } | null>(null)
  const toast = useToast()
  const maxNumber = 4

  return (
    <ImageUploading
      multiple
      value={images}
      onChange={onChange}
      maxNumber={maxNumber}
      maxFileSize={2194304}
      onError={(error) => {
        console.log(error)
        if (error?.maxNumber) {
          return toast({
            title: 'Maximo de imagenes superado',
            description: `Solo es posible agregar ${maxNumber} images por producto.`,
            status: 'warning',
            duration: 2000,
            isClosable: true,
            position: 'top-right'
          })
        }

        if (error?.maxFileSize) {
          return toast({
            title: 'Tamaño de archivo superado',
            description: 'asegurese que su archivo no supere los 2MB',
            status: 'warning',
            duration: 2000,
            isClosable: true,
            position: 'top-right'
          })
        }
      }}>
      {({ imageList, onImageUpload, onImageRemove, isDragging, dragProps }) => (
        <Box>
          <Flex
            direction='column'
            alignItems='center'
            borderColor={
              isDragging ? 'blue.600' : isError ? 'red.500' : 'gray.200'
            }
            borderStyle='dashed'
            borderWidth='2px'
            rounded='lg'
            p={3}
            {...dragProps}>
            <UploadIcon isDragging={isDragging} isError={isError} />
            <Box fontWeight='light'>
              <Text
                as='button'
                type='button'
                variant='unstyled'
                color={!isError ? 'blue.600' : 'red.500'}
                fontWeight='semibold'
                _hover={{ color: 'blue.700' }}
                onClick={onImageUpload}>
                click aquí para subir
              </Text>{' '}
              o desliza tus imagenes
            </Box>
            <Box fontWeight='light'>PNG, JPG o GIF menores a 2MB</Box>
          </Flex>
          <Grid
            mt={3}
            templateColumns={[
              'repeat(auto-fill, minmax(20px, 80px))',
              'repeat(auto-fill, minmax(20px, 100px))',
              'repeat(auto-fill, minmax(20px, 110px))'
            ]}
            gap={3}>
            {imageList.map((image, index) => (
              <Box
                key={index}
                position='relative'
                height='80px'
                overflow='hidden'
                rounded='md'>
                {image.dataURL && (
                  <Image
                    src={
                      !image.file
                        ? `${process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL}/${image.dataURL}`
                        : image.dataURL
                    }
                    alt='imagen del establecimiento'
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                )}
                <Box
                  as='button'
                  position='absolute'
                  top={-1}
                  right={-1}
                  color='white'
                  rounded='full'
                  type='button'
                  p={1}
                  onClick={() =>
                    setImageIndexToDelete({
                      image,
                      index
                    })
                  }>
                  <Icon as={BiX} boxSize={6} color='white' />
                </Box>
              </Box>
            ))}
          </Grid>
          {!!imageIndexToDelete && (
            <RemoveImageDialog
              isOpen={!!imageIndexToDelete}
              onClose={() => setImageIndexToDelete(null)}
              image={imageIndexToDelete.image}
              onConfirm={() => onImageRemove(imageIndexToDelete.index)}
            />
          )}
        </Box>
      )}
    </ImageUploading>
  )
}