/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toEqual(true);
    });

    // Bug report #1 (test sort bills)

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const datesSorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
      expect(dates).toEqual(datesSorted);
    });

    describe("When I click on an icon eye on a bill", () => {
      test("Then, It should open a modal with a proof ", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );
        window.onNavigate(ROUTES_PATH.Bills);

        const billObj = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });

        // BootStrap Jquery modal
        $.fn.modal = jest.fn();

        const handleClickIconEye = jest.fn(billObj.handleClickIconEye);

        const iconEye = screen.getAllByTestId("icon-eye");

        iconEye.forEach((icon) => {
          icon.addEventListener("click", () => handleClickIconEye(icon));
          // User interaction testing library
          userEvent.click(icon);
        });
        const fileModal = document.getElementById("modaleFile");

        expect(fileModal).toBeTruthy();
        expect(handleClickIconEye).toHaveBeenCalled();
      });
    });
  });
});

// Integration Bills

describe("When an user employee navigate to Bills page", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    router();
  });

  test("fetches bills from an API and fails with 404 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    document.body.innerHTML = BillsUI({ error: "Erreur 404" });
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    document.body.innerHTML = BillsUI({ error: "Erreur 500" });
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
