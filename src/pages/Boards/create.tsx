import { useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import CancelIcon from "@mui/icons-material/Cancel";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { FIELD_REQUIRED_MESSAGE } from "../../utils/validators";
import FieldErrorAlert from "../../components/Form/FieldErrorAlert";
import AbcIcon from "@mui/icons-material/Abc";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { createNewBoardAPI, createSampleBoardAPI } from "../../apis";

import { styled } from "@mui/material/styles";
import { useRole } from "../../context/RoleContext";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
const SidebarItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  padding: "12px 16px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: theme.palette.mode === "dark" ? "#33485D" : theme.palette.grey[300],
  },
  "&.active": {
    color: theme.palette.mode === "dark" ? "#90caf9" : "#0c66e4",
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#e9f2ff",
  },
}));

const BOARD_TYPES = {
  PUBLIC: "public",
  PRIVATE: "private",
};

interface SidebarCreateBoardModalProps {
  afterCreateNewBoard: () => void;
}

interface FormData {
  title?: string;
  description?: string;
  prompt?: string;
  type: string;
}

function SidebarCreateBoardModal({ afterCreateNewBoard }: SidebarCreateBoardModalProps) {
  const { ability } = useRole();
  const [isUseAI, setIsUseAI] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const handleOpenModal = () => {
    if (ability.cannot("manage", "board")) return;
    setIsOpen(true);
  };
  const handleCloseModal = () => {
    setIsOpen(false);
    reset();
  };

  const createSample = (prompt?: string) => {
    createSampleBoardAPI(prompt)
      .then(() => {
        afterCreateNewBoard?.();
      })
      .catch((error) => {});
  };

  const submitCreateNewBoard = (data: 
    { title?: string; description?: string; type: string; prompt?: string }
  ) => {

    if (isUseAI && data.prompt) {
      return createSample(data.prompt);
    }

    createNewBoardAPI(data).then(() => {
      // Bước 01: Đóng Modal
      handleCloseModal();
      // Bước 02: Thông báo đến component cha để xử lý
      afterCreateNewBoard();
    });
  };

  return (
    <>
      <SidebarItem onClick={handleOpenModal} sx={{ width: "100%", padding: "0px" }}>
        <Button
          variant="contained"
          startIcon={<LibraryAddIcon fontSize="small" />}
          fullWidth
          disabled={ability.cannot("manage", "board")}
        >
          Create a new board
        </Button>
      </SidebarItem>

      <Modal
        open={isOpen}
        // onClose={handleCloseModal} // chỉ sử dụng onClose trong trường hợp muốn đóng Modal bằng nút ESC hoặc click ra ngoài Modal
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "white",
            boxShadow: 24,
            borderRadius: "8px",
            border: "none",
            outline: 0,
            padding: "20px 30px",
            backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "white"),
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              cursor: "pointer",
            }}
          >
            <CancelIcon
              color="error"
              sx={{ "&:hover": { color: "error.light" } }}
              onClick={handleCloseModal}
            />
          </Box>
          <Box id="modal-modal-title" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LibraryAddIcon />
            <Typography variant="h6" component="h2">
              {" "}
              Create a new board
            </Typography>
          </Box>
          <Box id="modal-modal-description" sx={{ my: 2 }}>
            <div className="flex items-center space-x-2 mb-5">
              <Switch
                id="airplane-mode"
                checked={isUseAI}
                onCheckedChange={(checked) => {
                  setIsUseAI((prev) => !prev);
                }}
              />
              <Label htmlFor="airplane-mode">Create With AI</Label>
            </div>
            <form onSubmit={handleSubmit(submitCreateNewBoard)}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {!isUseAI && (
                  <>
                    <Box>
                      <TextField
                        fullWidth
                        label="Title"
                        type="text"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AbcIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        {...register("title", {
                          required: FIELD_REQUIRED_MESSAGE,
                          minLength: { value: 3, message: "Min Length is 3 characters" },
                          maxLength: { value: 50, message: "Max Length is 50 characters" },
                        })}
                        error={!!errors["title"]}
                      />
                      <FieldErrorAlert errors={errors} fieldName={"title"} />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Description"
                        type="text"
                        variant="outlined"
                        multiline
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionOutlinedIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        {...register("description", {
                          required: FIELD_REQUIRED_MESSAGE,
                          minLength: { value: 3, message: "Min Length is 3 characters" },
                          maxLength: { value: 255, message: "Max Length is 255 characters" },
                        })}
                        error={!!errors["description"]}
                      />
                      <FieldErrorAlert errors={errors} fieldName={"description"} />
                    </Box>
                  </>
                )}
                {
                  isUseAI && (
                    // Text Field Prompt 

                    <Box>
                      <TextField
                        fullWidth
                        label="Prompt"
                        type="text"
                        variant="outlined"
                        multiline
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionOutlinedIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        {...register("prompt", {
                          required: FIELD_REQUIRED_MESSAGE,
                          minLength: { value: 1, message: "Min Length is 3 characters" },
                          maxLength: { value: 2048, message: "Max Length is 2048 characters" },
                        })}
                        error={!!errors["prompt"]}
                      />
                      <FieldErrorAlert errors={errors} fieldName={"prompt"} />
                    </Box>
                  )
                }
                {/*
                 * Lưu ý đối với RadioGroup của MUI thì không thể dùng register tương tự TextField được mà phải sử dụng <Controller /> và props "control" của react-hook-form như cách làm dưới đây
                 * https://stackoverflow.com/a/73336103/8324172
                 * https://mui.com/material-ui/react-radio-button/
                 */}
                <Controller
                  name="type"
                  defaultValue={BOARD_TYPES.PUBLIC}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      row
                      onChange={(event, value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControlLabel
                        value={BOARD_TYPES.PUBLIC}
                        control={<Radio size="small" />}
                        label="Public"
                        labelPlacement="start"
                      />
                      <FormControlLabel
                        value={BOARD_TYPES.PRIVATE}
                        control={<Radio size="small" />}
                        label="Private"
                        labelPlacement="start"
                      />
                    </RadioGroup>
                  )}
                />

                <Box sx={{ alignSelf: "flex-end", gap: 2, display: "flex" }}>
                  {
                    !isUseAI && (
                      <>
                      <Button variant="outlined" color="primary" onClick={() => createSample()}>
                        Create Sample Board
                      </Button>
                      <Button
                        className="interceptor-loading"
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Create
                      </Button>
                      </>
                    )
                  }

                  {
                    isUseAI && (
                      <Button
                        className="interceptor-loading"
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Create Board With AI
                      </Button>
                    )
                  }
                </Box>
              </Box>
            </form>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default SidebarCreateBoardModal;
