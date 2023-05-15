/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });

    test("Then new bill icon in vertical layout should be highlighted", () => {
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.classList.contains("active-icon")).toEqual(true);
    });

    test("Then should have a select button required", () => {
      const selectBtn = screen.getByTestId("expense-type");
      expect(selectBtn.selectedOptions[0].innerHTML).toEqual("Transports");
    });

    test("Then should have à input which can add the name of this new bill", () => {
      const inputName = screen.getByTestId("expense-name");
      expect(inputName.placeholder).toEqual("Vol Paris Londres");
    });

    test("Then should have an input type date required", () => {
      const inputDate = screen.getByTestId("datepicker");
      expect(inputDate).toBeTruthy();
    });

    test("Then should have à input which can add the amount of this new bill", () => {
      const inputAmount = screen.getByTestId("amount");
      expect(inputAmount.placeholder).toEqual("348");
    });

    test("Then should have à input which can add the TVA (vat) of this new bill", () => {
      const inputVat = screen.getByTestId("vat");
      expect(inputVat.placeholder).toEqual("70");
    });

    test("Then should have à input which can add the TVA (pct) of this new bill", () => {
      const inputPct = screen.getByTestId("pct");
      expect(inputPct.placeholder).toEqual("20");
    });

    describe("When i click directly to the submit button without fill any informations", () => {
      test("The submit post not working, and an instruction appears on my screen telling me to complete the date field", () => {
        const submitBtn = screen.getByText("Envoyer");
        const inputDate = screen.getByTestId("datepicker");
        userEvent.click(submitBtn);
        expect(inputDate.value).toBe("");
      });
    });

    test("Then i need to save the bill", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillInit = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("When i need to show the NewBill page", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });

    //Test integration POST
    test("When i want to submit a NewBill with a validate file", async () => {
      // implement window.alert
      const jsdomAlert = window.alert;
      window.alert = () => {};

      jest.spyOn(mockStore, "bills");

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillObj = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const formNewBill = screen.getByTestId("form-new-bill");
      const fileBill = screen.getByTestId("file");

      const file = new File(["image"], "image.jpg", { type: "image/jpg" });

      const handleChangeFile = jest.fn((e) => newBillObj.handleChangeFile(e));

      fileBill.addEventListener("change", handleChangeFile);
      userEvent.upload(fileBill, file);

      const handleSubmit = jest.fn((e) => newBillObj.handleSubmit(e));

      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);

      expect(fileBill).toBeDefined();
      expect(handleChangeFile).toHaveBeenCalled();
      expect(handleSubmit).toHaveBeenCalled();
      window.alert = jsdomAlert;
    });
  });
});
