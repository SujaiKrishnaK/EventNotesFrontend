import React, { useEffect, useState } from "react";
import styles from "./notes.module.css";
import api from "../axios";
import jwt from "jwt-decode";
import Cookie from "js-cookie";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const Notes = () => {
  const [taskValue, setTaskValue] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [notification, setNotification] = useState({
    status: false,
    content: "",
  });
  const [loggedInUser, setLoggedInuser] = useState({});
  const [taskList, setTaskList] = useState([]);
  const [isLogin, setisLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValue, setFormValue] = useState({
    email: "",
    password: "",
  });
  const { tasklist, tasklabel, mainwrapper, tasktext, date } = styles;

  useEffect(() => {
    if (notification.status) {
      setTimeout(() => setNotification({ status: false, content: "" }), 1500);
    }
  }, [notification.status]);

  useEffect(() => {
    let token = Cookie.get("jwtToken");
    if (token?.length) {
      let user = jwt(token);
      setLoggedInuser(user);
      getList();
    }
  }, [startDate]);

  useEffect(() => {
    // if (Object.values(loggedInUser).length === 0) {
    //   let btn = document.getElementById("login-btn");
    //   btn.click();
    // } else {
    //   let modal = document.getElementById("modal-close");
    //   modal?.click();
    // }
  }, [loggedInUser]);

  const getList = () => {
    setIsLoading(true);
    api
      .get(`/getList?date=${startDate}`)
      .then((res) => {
        setTaskList(res?.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setTaskList([]);
      });
  };

  const updateCompleted = (e, li) => {
    let checked = !li.completed;
    setIsLoading(true);
    api
      .patch("/updateCompleted", {
        ...li,
        completed: checked,
      })
      .then((res) => {
        setIsLoading(false);
        console.log(res, "update method");
      });
    setTimeout(() => getList(), 1000);
  };

  const addTolist = () => {
    setIsLoading(true);
    api
      .post("/addtodo", {
        name: taskValue,
        completed: false,
        createdDate: startDate,
      })
      .then((res) => {
        setIsLoading(false);
        console.log(res?.data, "post method");
      });
    setTaskValue("");
    setTimeout(() => getList(), 1000);
  };
  const deleteTask = (li) => {
    api
      .delete("/deletetask", {
        headers: {},
        data: { id: li._id },
      })
      .then((res) => console.log(res, "DELETE METHOD"));
    setTimeout(() => getList(), 1000);
  };
  const SignUp = (val) => {
    api.post("/signup", { ...val }).then((res) => {
      if (res?.data) {
        // alert(res?.data);
        setNotification({
          status: true,
          content: res?.data,
        });
      }
      if (res?.data === "Success") {
        setisLogin(true);
      }
    }).catch(err => {
      setNotification({
        status: true,
        content: err?.message,
      });
    });
  };
  const Login = (val) => {
    api
      .post("/login", { ...val })
      .then((res) => {
        if (res?.data) {
          // alert("User Successfully LoggedIn");
          setNotification({
            status: true,
            content: "User Successfully LoggedIn",
          });
          Cookie.set("jwtToken", res?.data?.token);
          let token = Cookie.get("jwtToken");
          if (token) {
            let user = jwt(token);
            setLoggedInuser(user);
            getList();
            let modal = document.getElementById("modal-close");
            modal?.click();
          }
        }
      })
      .catch((err) => {
        let modal = document.getElementById("modal-close");
        modal?.click();
        let error = err.response.data.msg;
        setNotification({ status: true, content: error });
      });
  };
  const authenticate = () => {
    isLogin ? Login(formValue) : SignUp(formValue);
  };
  const inputChange = (e) => {
    setFormValue({
      ...formValue,
      [e.target.name]: e.target.value,
    });
  };
  const renderLoginForm = () => {
    return (
      <div className="mb-3">
        <input
          type="email"
          className="form-control my-2"
          id="exampleFormControlInput1"
          placeholder="Email ID"
          name="email"
          onChange={inputChange}
        />

        <input
          type="password"
          className="form-control"
          id="exampleFormControlInput2"
          placeholder="Password"
          name="password"
          onChange={inputChange}
        />
      </div>
    );
  };

  const sendMail = (li) => {
    api
      .post("/mail", {
        task: li,
      })
      .then((res) => {
        console.log(res);
      });
  };

  const showModal = () => {
    return (
      <div
        className="modal fade bg-secondary"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header flex-column">
              <h5 className="modal-title" id="exampleModalLabel">
                {isLogin ? "Please login to your account" : "Please Signup"}
              </h5>
              {!isLogin ? (
                <p>
                  Already registered ? Please Login by{" "}
                  <a href="#" onClick={() => setisLogin(true)}>
                    Clicking here
                  </a>
                </p>
              ) : (
                <p>
                  Not registered ? Please Signup by{" "}
                  <a href="#" onClick={() => setisLogin(false)}>
                    Clicking here
                  </a>
                </p>
              )}
            </div>
            <div className="modal-body">{renderLoginForm()}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                id="modal-close"
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={authenticate}
              >
                {isLogin ? "Login" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={"" + mainwrapper}>
      {notification.status && (
        <div className="alert alert-primary" role="alert">
          {notification.content}
        </div>
      )}
      <h1 className="text-info w-100 p-3 text-center d-flex justify-content-center align-items-center fw-bolder bg-dark">
        <span className="w-50 d-flex justify-content-end align-items-center">
          Notes
        </span>

        <span className="w-50 d-flex justify-content-end align-items-center">
          <button
            className="material-symbols-outlined btn btn-secondary mx-3"
            onClick={() => {
              Cookie.remove("jwtToken");
              // alert("You have been Logged Out!");
              setNotification({
                status: true,
                content: "You have been Logged Out!",
              });
              setLoggedInuser({});
              getList();
            }}
          >
            <span className="">logout</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary fw-bolder position-relative "
            id="login-btn"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
          >
            {loggedInUser?.emailId ? loggedInUser?.emailId : "Please Login"}
            <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle"></span>
          </button>
        </span>
      </h1>
      {showModal()}
      <div className="w-100 d-flex justify-content-center py-3 align-items-center ">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="d-flex justify-content-center align-items-center"
          customInput={
            <button className="mx-2 btn btn-secondary  text-info fw-bolder">
              <span className="material-symbols-outlined mx-2">calendar_month</span>{" "}
              {`${startDate.getDate()} ${
                month[startDate.getMonth()]
              } ${startDate.getFullYear()}`}
            </button>
          }
        />
      </div>
      <div>
        <div className="w-100 d-flex justify-content-center align-items-center ">
          <div className="w-50 d-flex justify-content-center align-items-center ">
            <input
              className="my-3 w-50 mx-3 form-control"
              value={taskValue}
              placeholder="Task here"
              type="text"
              onChange={(e) => {
                setTaskValue(e.target.value);
              }}
            ></input>
            <button
              className="mx-2 w-25 btn btn-info text-dark fw-bolder"
              onClick={addTolist}
            >
              Add Task
            </button>
          </div>
        </div>
        <div className="w-100 d-flex justify-center flex-column align-center">
          <div className="w-50 align-self-center">
            {taskList?.length > 0 &&
              taskList?.map((li) => {
                return (
                  <div key={li._id} className={tasklist + " my-2"}>
                    <label className={tasklabel + " text-success"}>
                      <div
                        className={`input-group-text  mx-3 ${
                          li.completed ? "bg-success" : "bg-info"
                        }`}
                        onClick={(e) => updateCompleted(e, li)}
                      >
                        {li.completed ? (
                          <span className="mx-2 text-light material-icons">
                            done
                          </span>
                        ) : (
                          <span className=" mx-2 text-light material-icons">
                            radio_button_unchecked
                          </span>
                        )}
                        <span className={tasktext}>{li.name} </span>

                        {isLoading ? (
                          <div
                            className="mx-3 spinner-grow text-light"
                            role="status"
                            style={{ width: "15px", height: "15px" }}
                          ></div>
                        ) : null}
                      </div>
                    </label>
                    <button
                      type="button"
                      className="btn btn-secondary ml-3 w-25"
                      onClick={() => deleteTask(li)}
                    >
                      <span>Delete</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary mx-3 material-symbols-outlined"
                      onClick={() => sendMail(li)}
                    >
                      <span className="">notifications_active</span>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
